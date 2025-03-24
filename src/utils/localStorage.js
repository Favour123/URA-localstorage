// Local Storage Keys
const STORAGE_KEYS = {
  QUESTIONS: 'ura_questions',
  USER_EMAIL: 'ura_user_email',
  RESOURCES: 'ura_resources',
};

// Get data from local storage
export const getFromStorage = (key) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
};

// Save data to local storage
export const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
};

// Questions-specific functions
export const getQuestions = () => {
  return getFromStorage(STORAGE_KEYS.QUESTIONS) || [];
};

export const saveQuestions = (questions) => {
  return saveToStorage(STORAGE_KEYS.QUESTIONS, questions);
};

export const addQuestion = (question) => {
  const questions = getQuestions();
  questions.unshift(question);
  return saveQuestions(questions);
};

// Resources functions
export const getResources = (category = null) => {
  const resources = getFromStorage(STORAGE_KEYS.RESOURCES) || [];
  if (category) {
    return resources.filter(resource => resource.category === category);
  }
  return resources;
};

export const saveResources = (resources) => {
  return saveToStorage(STORAGE_KEYS.RESOURCES, resources);
};

export const addResource = (resource) => {
  const resources = getResources();
  const newResource = {
    ...resource,
    id: Date.now(),
    uploadDate: new Date().toISOString(),
    downloads: 0
  };
  resources.unshift(newResource);
  return saveResources(resources);
};

// User email functions
export const getUserEmail = () => {
  return getFromStorage(STORAGE_KEYS.USER_EMAIL) || '';
};

export const saveUserEmail = (email) => {
  return saveToStorage(STORAGE_KEYS.USER_EMAIL, email);
};

// Add some initial mock data if none exists
export const initializeMockData = () => {
  const existingResources = getResources();
  if (existingResources.length === 0) {
    const mockResources = [
      {
        id: 1,
        title: 'Introduction to React',
        description: 'Comprehensive guide to React basics',
        category: 'lecture-notes',
        type: 'PDF',
        downloadUrl: '#',
        uploadDate: '2024-01-27T10:00:00Z',
        downloads: 125,
        fileSize: '2.5 MB'
      },
      {
        id: 2,
        title: 'Database Systems',
        description: 'Advanced database concepts',
        category: 'lecture-notes',
        type: 'PDF',
        downloadUrl: '#',
        uploadDate: '2024-01-26T15:30:00Z',
        downloads: 89,
        fileSize: '1.8 MB'
      }
    ];
    saveResources(mockResources);
  }
}; 