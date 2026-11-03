package com.rockfallPredictionSystem.data_service.service;

import com.rockfallPredictionSystem.data_service.dto.SensorRequest;
import com.rockfallPredictionSystem.data_service.entity.Mine;
import com.rockfallPredictionSystem.data_service.entity.Sensor;
import com.rockfallPredictionSystem.data_service.repository.MineRepository;
import com.rockfallPredictionSystem.data_service.repository.SensorRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SensorService {

    private final SensorRepository sensorRepository;
    private final MineRepository mineRepository;

    public SensorService(SensorRepository sensorRepository, MineRepository mineRepository) {
        this.sensorRepository = sensorRepository;
        this.mineRepository = mineRepository;
    }

    public Sensor createSensor(SensorRequest request) {
        Mine mine = mineRepository.findById(request.getMineId())
                .orElseThrow(() -> new RuntimeException("Mine not found with id: " + request.getMineId()));

        Sensor sensor = new Sensor();
        sensor.setSensorName(request.getSensorName());
        sensor.setSensorType(request.getSensorType());
        sensor.setStatus(request.getStatus());
        sensor.setMine(mine);

        return sensorRepository.save(sensor);
    }

    public List<Sensor> getAllSensors() {
        return sensorRepository.findAll();
    }

    public Sensor getSensorById(Long id) {
        return sensorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sensor not found with id: " + id));
    }

    public Sensor updateSensor(Long id, SensorRequest request) {
        Sensor existingSensor = sensorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sensor not found with id: " + id));

        Mine mine = mineRepository.findById(request.getMineId())
                .orElseThrow(() -> new RuntimeException("Mine not found with id: " + request.getMineId()));

        existingSensor.setSensorName(request.getSensorName());
        existingSensor.setSensorType(request.getSensorType());
        existingSensor.setStatus(request.getStatus());
        existingSensor.setMine(mine);

        return sensorRepository.save(existingSensor);
    }

    public void deleteSensor(Long id) {
        if (!sensorRepository.existsById(id)) {
            throw new RuntimeException("Sensor not found with id: " + id);
        }
        sensorRepository.deleteById(id);
    }
}
