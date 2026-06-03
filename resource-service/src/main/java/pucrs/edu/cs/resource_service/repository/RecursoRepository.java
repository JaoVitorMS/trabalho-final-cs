package pucrs.edu.cs.resource_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pucrs.edu.cs.resource_service.model.Recurso;

public interface RecursoRepository extends JpaRepository<Recurso, Long> {
}
