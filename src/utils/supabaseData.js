import { supabase } from "./supabaseClient";

// Resources functions
export const getResources = async (category = null) => {
  try {
    let query = supabase.from("resources").select("*");

    if (category) {
      query = query.eq("category", category);
    }

    const { data, error } = await query.order("upload_date", {
      ascending: false,
    });

    if (error) throw error;
    return data.map((resource) => ({
      ...resource,
      downloads: parseInt(resource.downloads || 0),
      file_size: formatFileSize(resource.file_size),
    }));
  } catch (error) {
    console.error("Error fetching resources:", error);
    return [];
  }
};

export const addResource = async (resource) => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("resources")
      .insert([
        {
          title: resource.title,
          description: resource.description,
          category: resource.category,
          type: resource.type,
          download_url: resource.download_url,
          file_path: resource.file_path,
          file_size: resource.file_size,
          created_by: user.id,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error adding resource:", error);
    throw error;
  }
};

export const updateResourceDownloads = async (resourceId) => {
  try {
    const { data, error } = await supabase.rpc("increment_downloads", {
      resource_id: resourceId,
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating downloads:", error);
    throw error;
  }
};

// Questions/Forum functions
export const getQuestions = async () => {
  try {
    const { data, error } = await supabase
      .from("questions")
      .select(
        `
        *,
        answers(*)
      `
      )
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching questions:", error);
    throw error;
  }
};

export const getQuestionById = async (id) => {
  try {
    const { data, error } = await supabase
      .from("questions")
      .select(
        `
        *,
        answers(*)
      `
      )
      .eq("id", id)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error fetching question:", error);
    throw error;
  }
};

export const addQuestion = async (questionData) => {
  try {
    const { data, error } = await supabase
      .from("questions")
      .insert([
        {
          title: questionData.title,
          content: questionData.content,
          user_email: questionData.user_email,
        },
      ])
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error("Error adding question:", error);
    throw error;
  }
};

export const addAnswer = async (questionId, answerData) => {
  try {
    console.log("Adding answer:", { questionId, answerData });

    // Check if the question exists first
    const { error: questionError } = await supabase
      .from("questions")
      .select("id")
      .eq("id", questionId)
      .single();

    if (questionError) {
      console.error("Question check error:", questionError);
      throw new Error(`Question not found: ${questionError.message}`);
    }

    // Now add the answer
    const { data, error } = await supabase
      .from("answers")
      .insert([
        {
          question_id: questionId,
          content: answerData.content,
          user_email: answerData.user_email,
        },
      ])
      .select();

    if (error) {
      console.error("Insert answer error:", error);
      throw error;
    }

    console.log("Answer added successfully:", data);
    return data[0];
  } catch (error) {
    console.error("Error adding answer:", error);
    throw error;
  }
};

export const deleteQuestion = async (questionId) => {
  try {
    const { error } = await supabase
      .from("questions")
      .delete()
      .eq("id", questionId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting question:", error);
    throw error;
  }
};

export const deleteAnswer = async (answerId) => {
  try {
    const { error } = await supabase
      .from("answers")
      .delete()
      .eq("id", answerId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting answer:", error);
    throw error;
  }
};

// Helper function to format file size
export const formatFileSize = (bytes) => {
  if (!bytes || isNaN(bytes)) return "0 B";

  const sizes = ["B", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 B";

  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  if (i === 0) return bytes + " " + sizes[i];

  return (bytes / Math.pow(1024, i)).toFixed(2) + " " + sizes[i];
};

// Profile functions
export const getProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }
};

export const updateProfile = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

// Delete resource function
export const deleteResource = async (resourceId) => {
  try {
    // First get the resource to get the file path
    const { data: resource, error: fetchError } = await supabase
      .from("resources")
      .select("file_path")
      .eq("id", resourceId)
      .single();

    if (fetchError) throw fetchError;

    // Delete the file from storage
    const { error: storageError } = await supabase.storage
      .from("resources")
      .remove([resource.file_path]);

    if (storageError) throw storageError;

    // Delete the resource record
    const { error: deleteError } = await supabase
      .from("resources")
      .delete()
      .eq("id", resourceId);

    if (deleteError) throw deleteError;

    return true;
  } catch (error) {
    console.error("Error deleting resource:", error);
    throw error;
  }
};

// Comment out or remove this function if your table doesn't have a views column
// export const incrementQuestionViews = async (questionId) => {
//   try {
//     const { data: question } = await supabase
//       .from("questions")
//       .select("views")
//       .eq("id", questionId)
//       .single();
//
//     const currentViews = question?.views || 0;
//
//     const { error } = await supabase
//       .from("questions")
//       .update({ views: currentViews + 1 })
//       .eq("id", questionId);
//
//     if (error) throw error;
//   } catch (error) {
//     console.error("Error incrementing question views:", error);
//   }
// };
