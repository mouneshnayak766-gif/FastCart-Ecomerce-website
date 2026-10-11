package com.example.fastcart.ai;

import com.example.fastcart.ai.AiDtos.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/ai")
public class AiChatController {

    private final AiChatService service;
    private final AiStoreFacade facade;

    public AiChatController(AiChatService service, AiStoreFacade facade) {
        this.service = service;
        this.facade = facade;
    }

    @PostMapping("/chat")
    public ChatResponse chat(@Valid @RequestBody ChatRequest req,
                             @RequestHeader(value = "Authorization", required = false) String authorization,
                             HttpServletRequest http) {
        Long userId = facade.resolveUserId(authorization);
        // Behind a proxy, configure server.forward-headers-strategy so getRemoteAddr() is the real client IP.
        String rateKey = userId != null ? "u" + userId : "ip" + http.getRemoteAddr();
        return service.chat(userId, rateKey, req);
    }

    @PostMapping("/actions/{id}/confirm")
    public ActionResult confirm(@PathVariable String id,
                                @RequestHeader(value = "Authorization", required = false) String authorization) {
        return service.confirm(requireUser(authorization), id);
    }

    @PostMapping("/actions/{id}/cancel")
    public ResponseEntity<Void> cancel(@PathVariable String id,
                                       @RequestHeader(value = "Authorization", required = false) String authorization) {
        service.cancel(requireUser(authorization), id);
        return ResponseEntity.noContent().build();
    }

    private Long requireUser(String authorization) {
        Long id = facade.resolveUserId(authorization);
        if (id == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login required");
        return id;
    }
}
