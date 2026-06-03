package pucrs.edu.cs.resource_service.dto;

import lombok.Data;

@Data
public class RecursoDTO {
    private Long id;
    private String nome;
    private String descricao;
    private String tipoRecurso;
    private String categoriaNome;
}
