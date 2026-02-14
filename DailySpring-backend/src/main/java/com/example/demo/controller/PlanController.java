package com.example.demo.controller;

import com.example.demo.dto.PlanTitleDTO;
import com.example.demo.dto.UpdatePlanDTO;
import com.example.demo.entity.PlanEntity;
import com.example.demo.service.PlanService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/api/daily")
@CrossOrigin(origins = "http://localhost:5173")
public class PlanController {
    private final PlanService service;
    public PlanController(PlanService service) {
        this.service = service;
    }

    @PostMapping("/save")
    public PlanEntity savePlan(@RequestBody Map<String, String> body) {
        return service.savePlan(
                body.get("title"),
                body.get("plan"),
                body.get("status"),
                body.get("priority")
        );
    }

    @GetMapping("/completed")
    public List<PlanEntity> completedPlans() {
        return service.getCompletedPlans();
    }

    @GetMapping("/active")
    public List<PlanEntity> activePlans() {
        return service.getActivePlan();
    }


    @PatchMapping("/{id}/status") //patch method - update only a small part of an existing item
    public PlanEntity updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        //path variable - tells java to grab the value from url({id}) and turn it into a variable, so that we can use in our code
        //request body - the data is hidden inside the request(like letter inside an envelope), request body tells java to open that envelope and covert that json into something that java can read in this case it is Map<String, String>

        return service.updateStatus(id, body.get("status"));
    }

    @PatchMapping("/{id}/priority")
    public PlanEntity updatePriority(@PathVariable Long id, @RequestBody Map<String, String > body) {
        return service.updatePriority(id, body.get("priority"));
    }

    @GetMapping("/items")
    public List<PlanTitleDTO> getItems(@RequestParam(required = false) String sortBy) {
        return service.getItems(sortBy);
    }

    @PutMapping("/{id}")
    public PlanEntity updatePlan(@PathVariable Long id, @RequestBody UpdatePlanDTO dto) {
        return service.updatePlan(id, dto);
    }

    @GetMapping("/fetchAll/{id}")
    public PlanEntity getPlanById(@PathVariable Long id) {
        return service.getPlanById(id);
    }

    @DeleteMapping("/deletePlan/{id}")
    public void delPlan(@PathVariable Long id) {
        service.delPlan(id);
    }
}
