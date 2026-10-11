package com.example.fastcart.ai;

import com.example.fastcart.ai.AiDtos.ProductCard;
import org.junit.jupiter.api.Test;
import org.springframework.ai.chat.model.ToolContext;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AiSafetyTest {

    private final ProductCard phone = new ProductCard(1L, "Phone X", "Acme", "Mobile", 15999, 19999.0, 20, 4.4, 120, null, true, "desc");

    @Test
    void guestCannotProposeAddToCart() {
        AiStoreFacade store = mock(AiStoreFacade.class);
        AiTools tools = new AiTools(store, new PendingActionStore(300));
        AiRequestContext ctx = new AiRequestContext(null);

        String out = tools.proposeAddToCart(1L, 1, new ToolContext(Map.of("ctx", ctx)));

        assertTrue(out.startsWith("LOGIN_REQUIRED"));
        assertNull(ctx.pending());
    }

    @Test
    void proposeDoesNotTouchCart_andOnlyOwnerCanConfirmOnce() {
        AiStoreFacade store = mock(AiStoreFacade.class);
        when(store.findProduct(1L)).thenReturn(Optional.of(phone));
        when(store.hasAvailableStock(1L, 2)).thenReturn(true);
        PendingActionStore pending = new PendingActionStore(300);
        AiTools tools = new AiTools(store, pending);
        AiRequestContext ctx = new AiRequestContext(7L);

        tools.proposeAddToCart(1L, 2, new ToolContext(Map.of("ctx", ctx)));

        verify(store, never()).addToCart(anyLong(), anyLong(), anyInt());
        String id = ctx.pending().id();
        assertThrows(AiExceptions.InvalidActionException.class, () -> pending.take(id, 8L)); // other user
        assertEquals(2, pending.take(id, 7L).quantity());
        assertThrows(AiExceptions.InvalidActionException.class, () -> pending.take(id, 7L)); // replay
    }

    @Test
    void rateLimiterBlocksAfterLimit() {
        AiRateLimiter limiter = new AiRateLimiter(3);
        for (int i = 0; i < 3; i++) limiter.check("u1");
        assertThrows(AiExceptions.RateLimitExceededException.class, () -> limiter.check("u1"));
        limiter.check("u2"); // other keys unaffected
    }
}
