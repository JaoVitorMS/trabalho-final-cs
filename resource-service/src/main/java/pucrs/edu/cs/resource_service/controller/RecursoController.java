package pucrs.edu.cs.resource_service.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pucrs.edu.cs.resource_service.dto.RecursoDTO;
import pucrs.edu.cs.resource_service.model.Auditorio;
import pucrs.edu.cs.resource_service.model.Notebook;
import pucrs.edu.cs.resource_service.service.RecursoService;

import java.util.List;

@RestController
@RequestMapping("/resources")
@RequiredArgsConstructor
public class RecursoController {

    private final RecursoService recursoService;

    @GetMapping
    public ResponseEntity<List<RecursoDTO>> listarTodos() {
        return ResponseEntity.ok(recursoService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RecursoDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(recursoService.buscarPorId(id));
    }

    @PostMapping("/auditorios")
    public ResponseEntity<RecursoDTO> cadastrarAuditorio(@RequestBody Auditorio auditorio) {
        return ResponseEntity.ok(recursoService.cadastrar(auditorio));
    }

    @PostMapping("/notebooks")
    public ResponseEntity<RecursoDTO> cadastrarNotebook(@RequestBody Notebook notebook) {
        return ResponseEntity.ok(recursoService.cadastrar(notebook));
    }
}
