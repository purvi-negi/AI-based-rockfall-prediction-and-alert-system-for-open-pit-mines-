package com.rockfallPredictionSystem.data_service.service;

import com.rockfallPredictionSystem.data_service.entity.Mine;
import com.rockfallPredictionSystem.data_service.repository.MineRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MineService {

    private final MineRepository mineRepository;

    public MineService(MineRepository mineRepository) {
        this.mineRepository = mineRepository;
    }

    public Mine createMine(Mine mine) {
        mine.setId(null);
        return mineRepository.save(mine);
    }

    public List<Mine> getAllMines() {
        return mineRepository.findAll();
    }

    public Mine getMineById(Long id) {
        return mineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mine not found with id: " + id));
    }

    public Mine updateMine(Long id, Mine mineDetails) {
        Mine existingMine = mineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mine not found with id: " + id));

        existingMine.setMineName(mineDetails.getMineName());
        existingMine.setLocation(mineDetails.getLocation());
        existingMine.setSlopeAngle(mineDetails.getSlopeAngle());
        existingMine.setStatus(mineDetails.getStatus());

        return mineRepository.save(existingMine);
    }

    public void deleteMine(Long id) {
        if (!mineRepository.existsById(id)) {
            throw new RuntimeException("Mine not found with id: " + id);
        }
        mineRepository.deleteById(id);
    }
}
