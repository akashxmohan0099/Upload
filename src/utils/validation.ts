// Input validation utilities for forms
// Ready for backend integration with proper validation

export const validation = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  password: (password: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  },
  
  phone: (phone: string): boolean => {
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  },
  
  url: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
  
  required: (value: any): boolean => {
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return value !== null && value !== undefined;
  },
  
  minLength: (value: string, min: number): boolean => {
    return value.trim().length >= min;
  },
  
  maxLength: (value: string, max: number): boolean => {
    return value.trim().length <= max;
  },
  
  sanitizeInput: (input: string): string => {
    // Remove potentially harmful characters while preserving legitimate ones
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .trim();
  }
};

// Form-specific validators
export const formValidators = {
  validateSignup: (data: {
    email: string;
    password: string;
    name: string;
    userType: string;
  }): { valid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};
    
    if (!validation.email(data.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    const passwordValidation = validation.password(data.password);
    if (!passwordValidation.valid) {
      errors.password = passwordValidation.errors[0];
    }
    
    if (!validation.minLength(data.name, 2)) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    if (!data.userType) {
      errors.userType = 'Please select a user type';
    }
    
    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  },
  
  validateLogin: (data: {
    email: string;
    password: string;
  }): { valid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};
    
    if (!validation.email(data.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!validation.required(data.password)) {
      errors.password = 'Password is required';
    }
    
    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  },
  
  validateJobPosting: (data: {
    title: string;
    description: string;
    requirements: string[];
    location: { city: string; country: string };
    type: string;
  }): { valid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};
    
    if (!validation.minLength(data.title, 3)) {
      errors.title = 'Job title must be at least 3 characters';
    }
    
    if (!validation.minLength(data.description, 50)) {
      errors.description = 'Description must be at least 50 characters';
    }
    
    if (!data.requirements || data.requirements.length === 0) {
      errors.requirements = 'At least one requirement is needed';
    }
    
    if (!validation.required(data.location?.city)) {
      errors.location = 'City is required';
    }
    
    if (!validation.required(data.type)) {
      errors.type = 'Employment type is required';
    }
    
    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  },
  
  validateCompanyProfile: (data: {
    name: string;
    industry: string;
    size: string;
    location: { city: string; country: string };
  }): { valid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};
    
    if (!validation.minLength(data.name, 2)) {
      errors.name = 'Company name must be at least 2 characters';
    }
    
    if (!validation.required(data.industry)) {
      errors.industry = 'Industry is required';
    }
    
    if (!validation.required(data.size)) {
      errors.size = 'Company size is required';
    }
    
    if (!validation.required(data.location?.city)) {
      errors.city = 'City is required';
    }
    
    if (!validation.required(data.location?.country)) {
      errors.country = 'Country is required';
    }
    
    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }
};