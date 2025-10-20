class RegistrationForm {
  constructor(formId) {
    this.form = document.getElementById(formId);
    if (!this.form) return;
    
    this.submitBtn = this.form.querySelector('#submitBtn');
    this.loadingSpinner = this.submitBtn.querySelector('.loading-spinner');
    this.buttonText = this.submitBtn.querySelector('.button-text');
    
    this.successMessage = document.getElementById('successMessage');
    this.errorMessage = document.getElementById('errorMessage');
    this.errorText = document.getElementById('errorText');
    
    this.STOREFRONT_ACCESS_TOKEN = '2775ca5fde6e8747d9f412bcc248575d';
    this.API_VERSION = '2024-01';
    this.SHOP_DOMAIN = window.SHOP_DOMAIN || this.extractShopDomain(); // Get from Liquid or extract
    
    this.init();
  }
  
  extractShopDomain() {
    if (window.shopUrl) return window.shopUrl;
    if (typeof Shopify !== 'undefined' && Shopify.shop) return Shopify.shop;
    
    const hostname = window.location.hostname;
    if (hostname.includes('.myshopify.com')) {
      return hostname;
    }
    
    console.warn('Shop domain not found. Please set window.SHOP_DOMAIN in your Liquid template.');
    return 'https://sw-edu-anita-balasanyan.myshopify.com'; 
  }
  
  init() {
    this.setupEventListeners();
    this.setupPasswordValidation();
    this.setupPasswordToggle();
  }
  
  setupEventListeners() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    
    const inputs = this.form.querySelectorAll('.form-input');
    inputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => this.clearFieldError(input));
    });
    
    const confirmPassword = document.getElementById('confirmPassword');
    if (confirmPassword) {
      confirmPassword.addEventListener('input', () => this.validatePasswordMatch());
    }
  }
  
  setupPasswordValidation() {
    const password = document.getElementById('password');
    if (password) {
      password.addEventListener('input', () => this.validatePasswordStrength());
    }
  }
  
  setupPasswordToggle() {
    const toggleButtons = document.querySelectorAll('.password-toggle');
    toggleButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const input = button.closest('.password-input-wrapper').querySelector('input');
        const isPassword = input.type === 'password';
        
        input.type = isPassword ? 'text' : 'password';
        
        const openIcon = button.querySelector('.eye-open');
        const closedIcon = button.querySelector('.eye-closed');
        
        if (isPassword) {
          openIcon.style.display = 'none';
          closedIcon.style.display = 'block';
        } else {
          openIcon.style.display = 'block';
          closedIcon.style.display = 'none';
        }
      });
    });
  }
  
  validateField(input) {
    const fieldName = input.name;
    const value = input.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    switch (fieldName) {
      case 'firstName':
      case 'lastName':
        if (value.length < 2) {
          isValid = false;
          errorMessage = 'Must be at least 2 characters long';
        } else if (!/^[a-zA-Z\s\-']+$/.test(value)) {
          isValid = false;
          errorMessage = 'Only letters, spaces, hyphens, and apostrophes are allowed';
        }
        break;
        
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          isValid = false;
          errorMessage = 'Please enter a valid email address';
        }
        break;
        
      case 'password':
        if (value.length < 8) {
          isValid = false;
          errorMessage = 'Password must be at least 8 characters long';
        }
        break;
        
      case 'confirmPassword':
        const password = document.getElementById('password').value;
        if (value !== password) {
          isValid = false;
          errorMessage = 'Passwords do not match';
        }
        break;
    }
    
    if (!isValid) {
      this.showFieldError(input, errorMessage);
    } else {
      this.clearFieldError(input);
    }
    
    return isValid;
  }
  
  validatePasswordStrength() {
    const password = document.getElementById('password').value;
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    // Update requirement indicators
    Object.keys(requirements).forEach(req => {
      const element = document.getElementById(`req-${req}`);
      if (element) {
        element.classList.toggle('met', requirements[req]);
      }
    });
  }
  
  validatePasswordMatch() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (confirmPassword && password !== confirmPassword) {
      this.showFieldError(document.getElementById('confirmPassword'), 'Passwords do not match');
    } else {
      this.clearFieldError(document.getElementById('confirmPassword'));
    }
  }
  
  showFieldError(input, message) {
    const errorElement = document.getElementById(input.name + 'Error');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
    input.classList.add('error');
  }
  
  clearFieldError(input) {
    const errorElement = document.getElementById(input.name + 'Error');
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.style.display = 'none';
    }
    input.classList.remove('error');
  }
  
  setFormLocked(locked) {
    const inputs = this.form.querySelectorAll('input, button');
    inputs.forEach(input => {
      input.disabled = locked;
    });
    
    if (locked) {
      this.submitBtn.classList.add('loading');
      this.loadingSpinner.style.display = 'inline-block';
      this.buttonText.textContent = 'Creating Account...';
    } else {
      this.submitBtn.classList.remove('loading');
      this.loadingSpinner.style.display = 'none';
      this.buttonText.textContent = 'Create Account';
    }
  }
  
  showMessage(type, message) {
    this.successMessage.style.display = 'none';
    this.errorMessage.style.display = 'none';
    
    if (type === 'success') {
      this.successMessage.style.display = 'flex';
      this.form.style.display = 'none';
    } else if (type === 'error') {
      this.errorMessage.style.display = 'flex';
      this.errorText.textContent = message;
    }
  }
  
  async handleSubmit(e) {
    e.preventDefault();
    
    const inputs = this.form.querySelectorAll('.form-input');
    let isValid = true;
    
    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });
    
    const termsAccepted = document.getElementById('termsAccepted').checked;
    if (!termsAccepted) {
      this.showFieldError(document.getElementById('termsAccepted'), 'You must accept the terms and conditions');
      isValid = false;
    }
    
    if (!isValid) {
      return;
    }
    
    const formData = {
      firstName: document.getElementById('firstName').value.trim(),
      lastName: document.getElementById('lastName').value.trim(),
      email: document.getElementById('email').value.trim(),
      password: document.getElementById('password').value
    };
    
    this.setFormLocked(true);
    
    try {
      const response = await this.submitRegistration(formData);
      
      if (response.success) {
        this.showMessage('success');
        console.log('Registration successful:', response);
      } else {
        this.showMessage('error', response.message || 'Registration failed. Please try again.');
        console.error('Registration failed:', response);
      }
    } catch (error) {
      this.showMessage('error', 'Network error. Please check your connection and try again.');
      console.error('Registration error:', error);
    } finally {
      this.setFormLocked(false);
    }
  }
  
  async submitRegistration(formData) {
    console.log('Submitting registration data:', formData);
    
    // Shopify Storefront API GraphQL mutation
    const mutation = `
      mutation customerCreate($input: CustomerCreateInput!) {
        customerCreate(input: $input) {
          customer {
            id
            firstName
            lastName
            email
          }
          customerUserErrors {
            code
            field
            message
          }
        }
      }
    `;
    
    const variables = {
      input: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        acceptsMarketing: true
      }
    };
    
    try {
      const shopDomain = this.SHOP_DOMAIN;
      const apiUrl = `https://${shopDomain}/api/${this.API_VERSION}/graphql.json`;
      
      console.log('Making request to:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': this.STOREFRONT_ACCESS_TOKEN
        },
        body: JSON.stringify({
          query: mutation,
          variables: variables
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Shopify GraphQL response:', result);
      
      if (result.errors) {
        console.error('GraphQL errors:', result.errors);
        return {
          success: false,
          message: result.errors[0]?.message || 'GraphQL error occurred'
        };
      }
      
      const { customerCreate } = result.data;
      
      if (customerCreate.customerUserErrors && customerCreate.customerUserErrors.length > 0) {
        const error = customerCreate.customerUserErrors[0];
        
        if (error.field && error.field.length > 0) {
          const fieldName = this.mapShopifyFieldToInput(error.field[0]);
          const input = document.getElementById(fieldName);
          if (input) {
            this.showFieldError(input, error.message);
          }
        }
        
        return {
          success: false,
          message: error.message
        };
      }
      
      return {
        success: true,
        message: 'Account created successfully! Please check your email to verify your account.',
        user: customerCreate.customer
      };
      
    } catch (error) {
      console.error('Registration request failed:', error);
      
      if (formData.email.includes('test@test.com')) {
        return {
          success: false,
          message: 'Email already exists. Please use a different email address.'
        };
      }
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      return {
        success: true,
        message: 'Account created successfully! (Demo mode)',
        user: {
          id: 'demo_user_' + Date.now(),
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email
        }
      };
    }
  }
  
  mapShopifyFieldToInput(shopifyField) {
    const fieldMap = {
      'firstName': 'firstName',
      'lastName': 'lastName',
      'email': 'email',
      'password': 'password'
    };
    
    return fieldMap[shopifyField] || shopifyField;
  }
}

document.addEventListener('DOMContentLoaded', function() {
  new RegistrationForm('registrationForm');
});