package com.rockfallPredictionSystem.data_service.controller;

import com.rockfallPredictionSystem.data_service.entity.Mine;
import com.rockfallPredictionSystem.data_service.service.MineService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/mines")
public class MineController {

    private final MineService mineService;

    public MineController(MineService mineService) {
        this.mineService = mineService;
    }

    @PostMapping
    public ResponseEntity<Mine> createMine(@RequestBody Mine mine) {
        Mine createdMine = mineService.createMine(mine);
        return new ResponseEntity<>(createdMine, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Mine>> getAllMines() {
        List<Mine> mines = mineService.getAllMines();
        return ResponseEntity.ok(mines);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Mine> getMineById(@PathVariable Long id) {
        Mine mine = mineService.getMineById(id);
        return ResponseEntity.ok(mine);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Mine> updateMine(@PathVariable Long id, @RequestBody Mine mineDetails) {
        Mine updatedMine = mineService.updateMine(id, mineDetails);
        return ResponseEntity.ok(updatedMine);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMine(@PathVariable Long id) {
        mineService.deleteMine(id);
        return ResponseEntity.noContent().build();
    }
}
