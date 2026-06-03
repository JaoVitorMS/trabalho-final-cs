package pucrs.edu.cs.auth_service.dto;

import lombok.Data;

@Data
public class UsuarioDTO {
    private Long id;
    private String username;
    private String role;
}
