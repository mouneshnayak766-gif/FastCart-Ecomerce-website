package com.example.fastcart.repository;

import com.example.fastcart.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByCategory(String category);
        Optional<Product> findByid(long id);
}