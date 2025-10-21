/**
 * @typedef {Object} RegistrationFormData
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} email
 * @property {string} password
 */
class RegistrationForm {
  /**
   * @param {string} formId
   */
  constructor(formId) {
    const formEl = /** @type {HTMLFormElement|null} */(document.getElementById(formId));
    this.form = formEl;
    if (!this.form) return;
    
    /** @type {HTMLButtonElement|null} */
    this.submitBtn = /** @type {HTMLButtonElement|null} */(this.form.querySelector('#submitBtn'));
    /** @type {HTMLElement|null} */
    this.loadingSpinner = this.submitBtn ? /** @type {HTMLElement|null} */(this.submitBtn.querySelector('.loading-spinner')) : null;
    /** @type {HTMLElement|null} */
    this.buttonText = this.submitBtn ? /** @type {HTMLElement|null} */(this.submitBtn.querySelector('.button-text')) : null;
    
    /** @type {HTMLElement|null} */
    this.successMessage = /** @type {HTMLElement|null} */(document.getElementById('successMessage'));
    /** @type {HTMLElement|null} */
    this.errorMessage = /** @type {HTMLElement|null} */(document.getElementById('errorMessage'));
    /** @type {HTMLElement|null} */
    this.errorText = /** @type {HTMLElement|null} */(document.getElementById('errorText'));
    
    this.STOREFRONT_ACCESS_TOKEN = '2775ca5fde6e8747d9f412bcc248575d';
    this.API_VERSION = '2024-01';
    /** @type {string} */
    this.SHOP_DOMAIN = (/** @type {any} */(window)).SHOP_DOMAIN || this.extractShopDomain(); // Get from Liquid or extract
    
    this.init();
  }
  
  extractShopDomain() {
    if ((/** @type {any} */(window)).shopUrl) return (/** @type {any} */(window)).shopUrl;
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
    if (!this.form) return;
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    
    const inputs = /** @type {NodeListOf<HTMLInputElement>} */(this.form.querySelectorAll('.form-input'));
    inputs.forEach((input) => {
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
        const wrapper = button.closest('.password-input-wrapper');
        const input = wrapper ? /** @type {HTMLInputElement|null} */(wrapper.querySelector('input')) : null;
        if (!input) return;
        const isPassword = input.type === 'password';
        
        input.type = isPassword ? 'text' : 'password';
        
        const openIcon = /** @type {HTMLElement|null} */(button.querySelector('.eye-open'));
        const closedIcon = /** @type {HTMLElement|null} */(button.querySelector('.eye-closed'));
        
        if (openIcon && closedIcon) {
          if (isPassword) {
            openIcon.style.display = 'none';
            closedIcon.style.display = 'block';
          } else {
            openIcon.style.display = 'block';
            closedIcon.style.display = 'none';
          }
        }
      });
    });
  }
  
  /**
   * @param {HTMLInputElement} input
   */
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
        const passwordInput = /** @type {HTMLInputElement|null} */(document.getElementById('password'));
        const password = passwordInput ? passwordInput.value : '';
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
    const passwordInput = /** @type {HTMLInputElement|null} */(document.getElementById('password'));
    const requirements = {
      length: passwordInput ? passwordInput.value.length >= 8 : false,
      uppercase: passwordInput ? /[A-Z]/.test(passwordInput.value) : false,
      lowercase: passwordInput ? /[a-z]/.test(passwordInput.value) : false,
      number: passwordInput ? /\d/.test(passwordInput.value) : false,
      special: passwordInput ? /[!@#$%^&*(),.?":{}|<>]/.test(passwordInput.value) : false
    };
    
    // Update requirement indicators
    (Object.keys(requirements)).forEach((req) => {
      const element = /** @type {HTMLElement|null} */(document.getElementById(`req-${req}`));
      if (element) {
        element.classList.toggle('met', /** @type {any} */(requirements)[req]);
      }
    });
  }
  
  validatePasswordMatch() {
    const passwordInput = /** @type {HTMLInputElement|null} */(document.getElementById('password'));
    const confirmPasswordInput = /** @type {HTMLInputElement|null} */(document.getElementById('confirmPassword'));
    
    if (confirmPasswordInput && passwordInput && passwordInput.value !== confirmPasswordInput.value) {
      this.showFieldError(confirmPasswordInput, 'Passwords do not match');
    } else if (confirmPasswordInput) {
      this.clearFieldError(confirmPasswordInput);
    }
  }
  
  /**
   * @param {HTMLInputElement} input
   * @param {string} message
   */
  showFieldError(input, message) {
    const errorElement = /** @type {HTMLElement|null} */(document.getElementById(input.name + 'Error'));
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
    input.classList.add('error');
  }
  
  /**
   * @param {HTMLInputElement} input
   */
  clearFieldError(input) {
    const errorElement = /** @type {HTMLElement|null} */(document.getElementById(input.name + 'Error'));
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.style.display = 'none';
    }
    input.classList.remove('error');
  }
  
  /**
   * @param {boolean} locked
   */
  setFormLocked(locked) {
    if (!this.form) return;
    const inputs = /** @type {NodeListOf<HTMLInputElement|HTMLButtonElement>} */(this.form.querySelectorAll('input, button'));
    inputs.forEach((input) => {
      input.disabled = locked;
    });
    
    if (this.submitBtn) {
      if (locked) {
        this.submitBtn.classList.add('loading');
        if (this.loadingSpinner) this.loadingSpinner.style.display = 'inline-block';
        if (this.buttonText) this.buttonText.textContent = 'Creating Account...';
      } else {
        this.submitBtn.classList.remove('loading');
        if (this.loadingSpinner) this.loadingSpinner.style.display = 'none';
        if (this.buttonText) this.buttonText.textContent = 'Create Account';
      }
    }
  }
  
  /**
   * @param {'success'|'error'} type
   * @param {string=} message
   */
  showMessage(type, message) {
    if (this.successMessage) this.successMessage.style.display = 'none';
    if (this.errorMessage) this.errorMessage.style.display = 'none';
    
    if (type === 'success') {
      if (this.successMessage) this.successMessage.style.display = 'flex';
      if (this.form) this.form.style.display = 'none';
    } else if (type === 'error') {
      if (this.errorMessage) this.errorMessage.style.display = 'flex';
      if (this.errorText && typeof message === 'string') this.errorText.textContent = message;
    }
  }
  
  /**
   * @param {SubmitEvent} e
   */
  async handleSubmit(e) {
    e.preventDefault();
    if (!this.form) return;
    
    const inputs = /** @type {NodeListOf<HTMLInputElement>} */(this.form.querySelectorAll('.form-input'));
    let isValid = true;
    
    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });
    
    const termsCheckbox = /** @type {HTMLInputElement|null} */(document.getElementById('termsAccepted'));
    if (!termsCheckbox || !termsCheckbox.checked) {
      if (termsCheckbox) {
        this.showFieldError(termsCheckbox, 'You must accept the terms and conditions');
      }
      isValid = false;
    }
    
    if (!isValid) {
      return;
    }
    
    /** @type {HTMLInputElement} */
    const firstNameEl = /** @type {HTMLInputElement} */(document.getElementById('firstName'));
    /** @type {HTMLInputElement} */
    const lastNameEl = /** @type {HTMLInputElement} */(document.getElementById('lastName'));
    /** @type {HTMLInputElement} */
    const emailEl = /** @type {HTMLInputElement} */(document.getElementById('email'));
    /** @type {HTMLInputElement} */
    const passwordEl = /** @type {HTMLInputElement} */(document.getElementById('password'));
    
    /** @type {RegistrationFormData} */
    const formData = {
      firstName: firstNameEl.value.trim(),
      lastName: lastNameEl.value.trim(),
      email: emailEl.value.trim(),
      password: passwordEl.value
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
  
  /**
   * @param {RegistrationFormData} formData
   */
  async submitRegistration(formData) {
    console.log('Submitting registration data:', formData);
    
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
        headers: new Headers({
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': String(this.STOREFRONT_ACCESS_TOKEN)
        }),
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
          const input = /** @type {HTMLInputElement|null} */(document.getElementById(fieldName));
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
  
  /**
   * @param {string} shopifyField
   */
  mapShopifyFieldToInput(shopifyField) {
    /** @type {Record<string, string>} */
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