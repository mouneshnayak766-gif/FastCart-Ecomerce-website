package com.example.fastcart.service;

import com.example.fastcart.model.Product;
import com.example.fastcart.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository repo;

    public ProductService(ProductRepository repo) {
        this.repo = repo;
    }

    public List<Product> getAllProducts() {
        return repo.findAll();
    }

    public List<Product> getByCategory(String category) {
        return repo.findByCategory(category);
    }
    public Product getProductById(Long id) {
    return repo.findById(id).orElse(null);
}
}