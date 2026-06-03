package pucrs.edu.cs.booking_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import pucrs.edu.cs.booking_service.dto.UsuarioDTO;

@FeignClient(name = "auth-service")
public interface AuthClient {
    @GetMapping("/auth/usuarios/{id}")
    UsuarioDTO buscarPorId(@PathVariable("id") Long id);
}
