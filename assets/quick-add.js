class QuickAddComponent extends HTMLElement {
  constructor() {
    super();
    this.handleClick = this.handleClick.bind(this);
  }

  connectedCallback() {
    this.button = this.querySelector('.quick-add__button');
    if (this.button) {
      this.button.addEventListener('click', this.handleClick);
    }
  }

  async handleClick(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const variantId = this.querySelector('input[name="id"]')?.value;
    if (!variantId) return;

    await this.addToCart(variantId);
  }

  async addToCart(variantId) {
    this.button.disabled = true;
    this.button.textContent = 'Adding...';

    try {
      await fetch('/cart/add.js', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({items: [{id: variantId, quantity: 1}]})
      });

      await this.updateCartCountsOnly();
      
      this.button.textContent = '✓ Added!';
      setTimeout(() => this.button.textContent = 'Add to Cart', 1500);
      
    } catch (error) {
      this.button.textContent = 'Error!';
      setTimeout(() => this.button.textContent = 'Add to Cart', 2000);
    } finally {
      this.button.disabled = false;
    }
  }

  async updateCartCountsOnly() {
    const cartResponse = await fetch('/cart.js');
    const cartData = await cartResponse.json();
    const itemCount = cartData.item_count;
    
    document.querySelectorAll('.cart-bubble__text-count, [ref="cartBubbleCount"]').forEach(el => {
      el.textContent = itemCount;
    });
    
    document.querySelectorAll('*').forEach(el => {
      const text = el.textContent.trim();
      if (/^\d+$/.test(text) && text.length < 4 && el.offsetWidth < 50) {
        el.textContent = itemCount;
      }
    });
  }
}

customElements.define('quick-add-component', QuickAddComponent);