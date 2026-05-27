package com.example.fastcart.controller;

import com.example.fastcart.model.Product;
import com.example.fastcart.service.ProductService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")

public class ProductController {

    private final ProductService service;

    public ProductController(ProductService service) {
        this.service = service;
    }

    @GetMapping
    public List<Product> getAllProducts() {
        return service.getAllProducts();
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