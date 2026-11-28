package com.citamedicas.sistemacitasmedicasweb.controller;

import com.citamedicas.sistemacitasmedicasweb.modelo.Cita;
import com.citamedicas.sistemacitasmedicasweb.modelo.Paciente;
import com.citamedicas.sistemacitasmedicasweb.repository.CitaRepository;
import com.citamedicas.sistemacitasmedicasweb.repository.PacienteRepository;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.List;

@RestController
@RequestMapping("/api/citas")
@CrossOrigin(origins = "http://localhost:5173")
public class CitaController {

    private final CitaRepository citaRepository;
    private final PacienteRepository pacienteRepository;

    public CitaController(
            CitaRepository citaRepository,
            PacienteRepository pacienteRepository) {
        this.citaRepository = citaRepository;
        this.pacienteRepository = pacienteRepository;
    }

    // Consultar todas las citas
    @GetMapping
    public List<Cita> listarCitas() {
        return citaRepository.findAll();
    }

    // Guardar una nueva cita
    @PostMapping
    public ResponseEntity<?> guardarCita(@RequestBody Cita cita) {

        if (cita.getPaciente() == null || cita.getPaciente().getId() == null) {
            return ResponseEntity.badRequest()
                    .body("Debe seleccionar un paciente.");
        }

        Paciente paciente = pacienteRepository
                .findById(cita.getPaciente().getId())
                .orElse(null);

        if (paciente == null) {
            return ResponseEntity.badRequest()
                    .body("El paciente seleccionado no existe.");
        }

        cita.setPaciente(paciente);

        Cita citaGuardada = citaRepository.save(cita);

        return ResponseEntity.ok(citaGuardada);
    }

    // Consultar una cita por ID
    @GetMapping("/{id}")
    public ResponseEntity<?> buscarCita(@PathVariable Long id) {

        return citaRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Eliminar una cita
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarCita(@PathVariable Long id) {

        if (!citaRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        citaRepository.deleteById(id);

        return ResponseEntity.ok().build();
    }
}