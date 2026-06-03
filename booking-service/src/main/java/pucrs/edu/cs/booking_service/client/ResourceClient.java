package pucrs.edu.cs.booking_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import pucrs.edu.cs.booking_service.dto.RecursoDTO;

@FeignClient(name = "resource-service")
public interface ResourceClient {
    @GetMapping("/resources/{id}")
    RecursoDTO buscarPorId(@PathVariable("id") Long id);
}
