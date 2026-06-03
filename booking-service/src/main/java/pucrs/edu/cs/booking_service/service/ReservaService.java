package pucrs.edu.cs.booking_service.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pucrs.edu.cs.booking_service.client.AuthClient;
import pucrs.edu.cs.booking_service.client.ResourceClient;
import pucrs.edu.cs.booking_service.dto.RecursoDTO;
import pucrs.edu.cs.booking_service.dto.UsuarioDTO;
import pucrs.edu.cs.booking_service.model.Reserva;
import pucrs.edu.cs.booking_service.producer.ReservaProducer;
import pucrs.edu.cs.booking_service.repository.ReservaRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservaService {

    private final ReservaRepository reservaRepository;
    private final AuthClient authClient;
    private final ResourceClient resourceClient;
    private final ReservaProducer reservaProducer;

    public Reserva reservar(Reserva reserva) {
        // 1. Validar se usuário existe e é Professor
        UsuarioDTO usuario = authClient.buscarPorId(reserva.getUsuarioId());
        if (!"PROFESSOR".equalsIgnoreCase(usuario.getRole())) {
            throw new RuntimeException("Apenas professores podem realizar reservas");
        }

        // 2. Validar se recurso existe
        RecursoDTO recurso = resourceClient.buscarPorId(reserva.getRecursoId());
        if (recurso == null) {
            throw new RuntimeException("Recurso não encontrado");
        }

        // 3. Salvar reserva
        reserva.setStatus("CONFIRMADA");
        Reserva salva = reservaRepository.save(reserva);

        // 4. Notificar via RabbitMQ
        reservaProducer.enviarEventoReservaCriada(salva);

        return salva;
    }

    public List<Reserva> listarTodas() {
        return reservaRepository.findAll();
    }
}
