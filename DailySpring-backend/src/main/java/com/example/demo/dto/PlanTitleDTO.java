package com.example.demo.dto;

//this class returns the titles with their ID to show in the homepage
public class PlanTitleDTO {
    private String title;
    private Long id;
    private String status;
    private String priority;

    public PlanTitleDTO(Long id, String title, String status, String priority) {
        this.id  = id;
        this.title = title;
        this.status = status;
        this.priority = priority;
    }
    public String getTitle() {
        return title;
    }
    public void setTitle(String title) {
        this.title = title;
    }
    public Long getId() {
        return id;
    }

    public String getStatus() {
        return status;
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
}
