package com.example.demo.service;

import com.example.demo.dto.PlanTitleDTO;
import com.example.demo.dto.UpdatePlanDTO;
import com.example.demo.entity.PlanEntity;
import com.example.demo.repository.PlanRepo;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PlanService {
    private final PlanRepo repo;
    public PlanService(PlanRepo repo) {
        this.repo = repo;
    }
    public PlanEntity savePlan(String title, String plan, String status, String priority) {
        PlanEntity entity = new PlanEntity();
        entity.setTitle(title);
        entity.setPlan(plan);
        entity.setStatus(status);
        entity.setPriority(priority);
        entity.setCompleted("Done".equals(status));
        entity.setCreatedAt(LocalDateTime.now());

        return repo.save(entity);
    }

    public PlanEntity updateStatus(Long id, String status) {
        PlanEntity plan = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Status not found"));
        plan.setStatus(status);
        plan.setCompleted("Done".equals(status));

        return repo.save(plan);
    }

    public PlanEntity updatePriority(Long id, String priority) {
        PlanEntity plan = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Priority not found"));
        plan.setPriority(priority);
        return repo.save(plan);
    }

    public List<PlanTitleDTO> getItems(String sortBy) {
        if("priority".equals(sortBy)) {
            return repo.findAll(Sort.by("priority"))
                    .stream() //stream - is basically a moving flow of data
                    .map(plan -> new PlanTitleDTO(
                            plan.getId(),
                            plan.getTitle(),
                            plan.getStatus(),
                            plan.getPriority()
                    ))
                    .toList();
        }
        if ("status".equals(sortBy)) {
            return repo.findAll(Sort.by("status"))
                    .stream()
                    .map(plan -> new PlanTitleDTO(
                            plan.getId(),
                            plan.getTitle(),
                            plan.getStatus(),
                            plan.getPriority()
                    ))
                    .toList();
        }
        return repo.findAll()
                .stream()
                .map(plan -> new PlanTitleDTO(
                        plan.getId(),
                        plan.getTitle(),
                        plan.getStatus(),
                        plan.getPriority()
                ))
                .toList();
    }

    public PlanEntity updatePlan(Long id, UpdatePlanDTO dto){
        PlanEntity existing = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Plan not found"));

        existing.setTitle(dto.getTitle());
        existing.setPlan(dto.getPlan());
        existing.setStatus(dto.getStatus());
        existing.setPriority(dto.getPriority());

        existing.setCompleted("Done".equals(dto.getStatus()));
        existing.setCreatedAt(LocalDateTime.now());

        return repo.save(existing);
    }

    public List<PlanEntity> getCompletedPlans() {
        return repo.findByCompleted(true);
    }

    public List<PlanEntity> getActivePlan() {
        return repo.findByCompleted(false);
    }

    public PlanEntity getPlanById(Long id) {
        return repo.findById(id).orElseThrow();
    }

    public void delPlan(Long id) {
        repo.deleteById(id);
    }
}
