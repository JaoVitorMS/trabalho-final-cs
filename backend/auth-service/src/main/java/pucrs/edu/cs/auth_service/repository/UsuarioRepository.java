package pucrs.edu.cs.auth_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pucrs.edu.cs.auth_service.model.Usuario;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByUsername(String username);
}
