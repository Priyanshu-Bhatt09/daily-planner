package com.example.demo.repository;

import com.example.demo.dto.PlanTitleDTO;
import com.example.demo.entity.PlanEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface PlanRepo extends JpaRepository<PlanEntity, Long> {
    List<PlanEntity> findByCompleted(boolean completed);
}
