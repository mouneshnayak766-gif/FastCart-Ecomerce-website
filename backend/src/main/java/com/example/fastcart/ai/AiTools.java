package com.example.fastcart.ai;

import com.example.fastcart.ai.AiDtos.OrderSummary;
import com.example.fastcart.ai.AiDtos.ProductCard;
import org.springframework.ai.chat.model.ToolContext;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Controlled tools the model may call. Rules:
 *  - userId always comes from ToolContext (set server-side from the JWT), never from model arguments.
 *  - Nothing here mutates data. Cart changes are only PROPOSED; the user confirms via a separate endpoint.
 */
@Component
public class AiTools {

    private final AiStoreFacade store;
    private final PendingActionStore pending;

    public AiTools(AiStoreFacade store, PendingActionStore pending) {
        this.store = store;
        this.pending = pending;
    }

    private static AiRequestContext ctx(ToolContext tc) {
        return (AiRequestContext) tc.getContext().get("ctx");
    }

    @Tool(description = "Search the FastCart catalogue. Use 1-2 plain keywords (e.g. 'headphones'), plus optional filters. Returns real products with price in INR, rating and stock.")
    public List<ProductCard> searchProducts(
            @ToolParam(description = "1-2 keywords, e.g. 'laptop'", required = false) String keywords,
            @ToolParam(description = "Category, e.g. Electronics, Mobile, Fashion, Books, Beauty, Furniture, Sports", required = false) String category,
            @ToolParam(description = "Minimum price in INR", required = false) Double minPrice,
            @ToolParam(description = "Maximum price in INR", required = false) Double maxPrice,
            ToolContext toolContext) {
        List<ProductCard> results = store.search(keywords, category, minPrice, maxPrice, 5);
        ctx(toolContext).addProducts(results);
        return results;
    }

    @Tool(description = "Get full details of one product by its numeric id.")
    public ProductCard getProductDetails(@ToolParam(description = "Product id") Long productId, ToolContext toolContext) {
        ProductCard p = store.findProduct(productId).orElse(null);
        if (p != null) ctx(toolContext).addProducts(List.of(p));
        return p;
    }

    @Tool(description = "Fetch 2-4 products by id so they can be compared on price, rating, stock and description.")
    public List<ProductCard> compareProducts(
            @ToolParam(description = "2 to 4 product ids") List<Long> productIds, ToolContext toolContext) {
        List<ProductCard> cards = productIds.stream().distinct().limit(4)
                .map(store::findProduct).flatMap(java.util.Optional::stream).toList();
        ctx(toolContext).addProducts(cards);
        return cards;
    }

    @Tool(description = "Propose adding a product to the user's cart. This ONLY shows a confirmation card; nothing is added until the user taps Confirm.")
    public String proposeAddToCart(
            @ToolParam(description = "Product id") Long productId,
            @ToolParam(description = "Quantity 1-10", required = false) Integer quantity,
            ToolContext toolContext) {
        AiRequestContext c = ctx(toolContext);
        if (c.userId() == null) return "LOGIN_REQUIRED: tell the user to log in before adding items to the cart.";
        ProductCard p = store.findProduct(productId).orElse(null);
        if (p == null) return "NOT_FOUND: no product with that id.";
        if (!p.inStock()) return "OUT_OF_STOCK: " + p.name() + " is currently unavailable.";
        int qty = quantity == null ? 1 : quantity;
        if (qty < 1 || qty > 10) return "INVALID_QUANTITY: quantity must be between 1 and 10.";
        if (!store.hasAvailableStock(productId, qty)) {
            return "INSUFFICIENT_STOCK: the requested quantity is not currently available.";
        }
        c.setPending(pending.createAddToCart(c.userId(), p, qty));
        return "CONFIRMATION_SHOWN: a confirm card for " + qty + " x " + p.name()
                + " is displayed. Do NOT say it was added. Ask the user to tap Confirm.";
    }

    @Tool(description = "List the logged-in user's most recent orders with status.")
    public Object getMyOrders(ToolContext toolContext) {
        AiRequestContext c = ctx(toolContext);
        if (c.userId() == null) return "LOGIN_REQUIRED: tell the user to log in to see orders.";
        List<OrderSummary> orders = store.ordersFor(c.userId());
        return orders.isEmpty() ? "NO_ORDERS" : orders;
    }

    @Tool(description = "Get the status of one of the logged-in user's orders by order id.")
    public Object getOrderStatus(@ToolParam(description = "Order id") Long orderId, ToolContext toolContext) {
        AiRequestContext c = ctx(toolContext);
        if (c.userId() == null) return "LOGIN_REQUIRED: tell the user to log in to see orders.";
        return store.orderFor(c.userId(), orderId).<Object>map(o -> o).orElse("NOT_FOUND: no such order on this account.");
    }
}
