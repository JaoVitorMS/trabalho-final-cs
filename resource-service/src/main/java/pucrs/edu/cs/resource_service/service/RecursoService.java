package pucrs.edu.cs.resource_service.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pucrs.edu.cs.resource_service.dto.RecursoDTO;
import pucrs.edu.cs.resource_service.model.Recurso;
import pucrs.edu.cs.resource_service.repository.RecursoRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecursoService {

    private final RecursoRepository recursoRepository;

    public List<RecursoDTO> listarTodos() {
        return recursoRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public RecursoDTO buscarPorId(Long id) {
        return recursoRepository.findById(id)
                .map(this::mapToDTO)
                .orElseThrow(() -> new RuntimeException("Recurso não encontrado"));
    }

    public RecursoDTO cadastrar(Recurso recurso) {
        Recurso salvo = recursoRepository.save(recurso);
        return mapToDTO(salvo);
    }

    private RecursoDTO mapToDTO(Recurso recurso) {
        RecursoDTO dto = new RecursoDTO();
        dto.setId(recurso.getId());
        dto.setNome(recurso.getNome());
        dto.setDescricao(recurso.getDescricao());
        dto.setTipoRecurso(recurso.getClass().getSimpleName());
        if (recurso.getCategoria() != null) {
            dto.setCategoriaNome(recurso.getCategoria().getNome());
        }
        return dto;
    }
}
