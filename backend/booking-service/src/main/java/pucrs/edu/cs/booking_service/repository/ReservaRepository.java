package pucrs.edu.cs.booking_service.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import pucrs.edu.cs.booking_service.model.Reserva;
import java.util.List;

public interface ReservaRepository extends MongoRepository<Reserva, String> {
    List<Reserva> findByRecursoId(Long recursoId);
}
