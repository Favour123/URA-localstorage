import { supabase } from "./supabaseClient";

// Get all resources with optional filtering
export const getResources = async (category = null) => {
  try {
    let query = supabase.from("resources").select("*");

    if (category) {
      // Match exactly with the database category
      query = query.eq("category", category);

      // Debug log to verify the category being queried
      console.log("Querying for category:", category);
    }

    const { data, error } = await query.order("upload_date", {
      ascending: false,
    });

    if (error) throw error;

    // Log the results to help debug
    console.log("Database query results:", {
      requestedCategory: category,
      foundResources: data?.map((r) => ({
        id: r.id,
        category: r.category,
        title: r.title,
      })),
      count: data?.length || 0,
    });

    return data || [];
  } catch (error) {
    console.error("Error fetching resources:", error);
    throw error;
  }
};

// Get a single resource by ID
export const getResourceById = async (id) => {
  try {
    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching resource:", error);
    throw error;
  }
};

// Track resource download
export const incrementDownload = async (id) => {
  try {
    // Call the RPC function we created in the SQL
    const { data, error } = await supabase.rpc("increment_resource_downloads", {
      resource_id: id,
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error incrementing download count:", error);
    // Don't throw here, just log - we don't want to block downloads if tracking fails
    return null;
  }
};

// Format file size for display
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Get icon based on resource type
export const getResourceIcon = (type) => {
  switch (type) {
    case "document":
      return "file-text";
    case "image":
      return "image";
    case "video":
      return "video";
    case "audio":
      return "music";
    default:
      return "file";
  }
};

// Get translated category name
export const getCategoryLabel = (categoryValue) => {
  const categories = {
    "conference-videos": "Conference Videos",
    "lecture-notes": "Lecture Notes",
    "past-questions": "Past Questions",
    "research-papers": "Research Papers",
    "journal-papers": "Journal Papers",
    "textbooks": "Textbooks",
    "other-resources": "Other Resources",
  };

  return categories[categoryValue] || categoryValue;
};
