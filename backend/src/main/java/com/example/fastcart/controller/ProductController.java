package com.example.fastcart.controller;

import com.example.fastcart.model.Product;
import com.example.fastcart.service.ProductService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
 // FIX: Was missing — caused CORS block from React frontend
public class ProductController {

    private final ProductService service;

    public ProductController(ProductService service) {
        this.service = service;
    }

    @GetMapping
    public List<Product> getAllProducts() {
        return service.getAllProducts();
    }

    // Must be declared BEFORE /{id} — Spring resolves paths top to bottom.
    // If /{id} came first, the string "categories" would be cast to Long and throw 400.
    @GetMapping("/categories")
    public List<String> getCategories() {
        return service.getCategories();
    }

    @GetMapping("/category/{category}")
    public List<Product> getByCategory(@PathVariable String category) {
        return service.getByCategory(category);
    }

    @GetMapping("/{id}")
    public Product getProductById(@PathVariable Long id) {
        return service.getProductById(id);
    }
}
