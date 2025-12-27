class CartService {
    private cart: Map<number, number> = new Map(); // Giỏ hàng lưu trữ theo ID sản phẩm và số lượng
    private productPrices: Map<number, number> = new Map(); // Lưu giá sản phẩm (để tính tổng giá)

    constructor() {
        // Lấy giỏ hàng từ localStorage khi khởi tạo
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
            const parsedCart = JSON.parse(storedCart);
            this.cart = new Map(parsedCart);
        }

        // Lấy giá sản phẩm từ localStorage hoặc API nếu cần
        const storedPrices = localStorage.getItem('productPrices');
        if (storedPrices) {
            this.productPrices = new Map(JSON.parse(storedPrices));
        }
    }

    // Thêm sản phẩm vào giỏ hàng
    addToCart(productId: number, quantity: number = 1, price: number): void {
        // Lưu giá sản phẩm vào Map
        this.productPrices.set(productId, price);

        if (this.cart.has(productId)) {
            // Nếu sản phẩm đã có trong giỏ, tăng số lượng
            this.cart.set(productId, this.cart.get(productId)! + quantity);
        } else {
            // Nếu sản phẩm chưa có trong giỏ, thêm mới
            this.cart.set(productId, quantity);
        }

        // Sau khi thêm sản phẩm vào giỏ, lưu lại giỏ vào localStorage
        this.saveCartToLocalStorage();
        this.saveProductPricesToLocalStorage();
    }

    // Lấy giỏ hàng
    getCart(): Map<number, number> {
        return this.cart;
    }

    // Tính tổng số lượng sản phẩm trong giỏ hàng
    getTotalItems(): number {
        let total = 0;
        this.cart.forEach((quantity) => {
            total += quantity;
        });
        return total;
    }

    // Tính tổng giá trị của giỏ hàng
    getTotalPrice(): number {
        let totalPrice = 0;
        this.cart.forEach((quantity, productId) => {
            const price = this.productPrices.get(productId);
            if (price) {
                totalPrice += price * quantity;
            }
        });
        return totalPrice;
    }

    // Lưu giỏ hàng vào localStorage
    private saveCartToLocalStorage(): void {
        const cartArray = Array.from(this.cart.entries());  // Chuyển Map thành mảng
        localStorage.setItem('cart', JSON.stringify(cartArray));  // Lưu mảng vào localStorage
    }

    // Lưu giá sản phẩm vào localStorage
    private saveProductPricesToLocalStorage(): void {
        const pricesArray = Array.from(this.productPrices.entries());  // Chuyển Map thành mảng
        localStorage.setItem('productPrices', JSON.stringify(pricesArray));  // Lưu giá sản phẩm vào localStorage
    }

    // Xóa giỏ hàng
    clearCart(): void {
        this.cart.clear();
        this.productPrices.clear();  // Xóa cả giá sản phẩm
        this.saveCartToLocalStorage();  // Cập nhật lại sau khi xóa giỏ hàng
        this.saveProductPricesToLocalStorage();  // Cập nhật lại giá sản phẩm
    }
}

export const cartService = new CartService();  // Khởi tạo CartService
