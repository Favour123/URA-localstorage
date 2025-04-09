// Helper functions for localStorage management

// Get user email from localStorage
export const getUserEmail = () => {
  return localStorage.getItem('userEmail') || '';
};

// Save user email to localStorage
export const saveUserEmail = (email) => {
  localStorage.setItem('userEmail', email);
};

// Get questions from localStorage
export const getQuestions = () => {
  try {
    const questions = localStorage.getItem('forumQuestions');
    return questions ? JSON.parse(questions) : [];
  } catch (error) {
    console.error('Error parsing questions from localStorage:', error);
    return [];
  }
};

// Save questions to localStorage
export const saveQuestions = (questions) => {
  try {
    localStorage.setItem('forumQuestions', JSON.stringify(questions));
  } catch (error) {
    console.error('Error saving questions to localStorage:', error);
  }
};

// Add a new question to localStorage
export const addQuestion = (question) => {
  try {
    const questions = getQuestions();
    questions.unshift(question); // Add to beginning of array
    saveQuestions(questions);
    return question;
  } catch (error) {
    console.error('Error adding question to localStorage:', error);
    throw error;
  }
};

// Get a question by ID from localStorage
export const getQuestionById = (id) => {
  try {
    const questions = getQuestions();
    return questions.find(q => q.id.toString() === id.toString()) || null;
  } catch (error) {
    console.error('Error getting question by ID from localStorage:', error);
    return null;
  }
};

// Add an answer to a question in localStorage
export const addAnswer = (questionId, answer) => {
  try {
    const questions = getQuestions();
    const questionIndex = questions.findIndex(q => q.id.toString() === questionId.toString());
    
    if (questionIndex === -1) {
      throw new Error('Question not found');
    }
    
    // Initialize answers array if it doesn't exist
    if (!questions[questionIndex].answers) {
      questions[questionIndex].answers = [];
    }
    
    // Create answer object
    const newAnswer = {
      id: Date.now(),
      content: answer.content,
      user_email: answer.user_email,
      created_at: new Date().toISOString(),
      is_admin_response: answer.is_admin_response || false
    };
    
    // Add answer to question
    questions[questionIndex].answers.push(newAnswer);
    
    // Mark question as answered
    questions[questionIndex].isAnswered = true;
    
    // Save updated questions
    saveQuestions(questions);
    
    return newAnswer;
  } catch (error) {
    console.error('Error adding answer to localStorage:', error);
    throw error;
  }
}; 