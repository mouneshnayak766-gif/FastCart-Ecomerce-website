package com.example.fastcart.service;

import com.example.fastcart.model.Product;
import com.example.fastcart.repository.ProductRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // FIX: Was repo.findByCategory(category) — that method does not exist in ProductRepository.
    //      The declared method is findByCategoryIgnoreCase(). Using the wrong name causes a
    //      Spring Data query-derivation exception at application startup, not at runtime.
    public List<Product> getByCategory(String category) {
        return productRepository.findByCategoryIgnoreCase(category);
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Product not found: " + id));
    }
}
