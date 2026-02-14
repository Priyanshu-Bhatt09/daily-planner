package com.example.demo.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "plans")
public class PlanEntity {
    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String plan;
    private String status;
    private String priority;
    private Boolean completed;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    public PlanEntity(){}
    public PlanEntity(String title, String plan, String status, String priority, Boolean completed){
        this.title = title;
        this.plan = plan;
        this.status = status;
        this.priority = priority;
        this.completed = completed;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId(){ return id; }
    public String getPlan() { return plan; }
    public String getTitle() { return title; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public String getStatus() {
        return status;
    }

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(Boolean completed) {
        this.completed = completed;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setPlan(String plan) {
        this.plan = plan;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
