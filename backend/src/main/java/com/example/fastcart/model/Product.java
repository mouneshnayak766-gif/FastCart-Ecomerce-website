package com.example.fastcart.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private double price;
    private String category;
  @Column(name = "image_url")
private String imageUrl; 
private String description;
private Double rating;
private Integer stock;
}