package pucrs.edu.cs.booking_service.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import pucrs.edu.cs.booking_service.model.Reserva;
import pucrs.edu.cs.booking_service.repository.ReservaRepository;

import java.time.LocalDateTime;
import java.util.List;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final ReservaRepository repository;

    @Bean
    public CommandLineRunner initData() {
        return args -> {
            if (repository.count() == 0) {
                Reserva r1 = Reserva.builder()
                        .usuarioId(2L) // usuario 'user' do auth-service
                        .recursoId(1L) // 'Auditório Principal' do resource-service
                        .dataInicio(LocalDateTime.now().plusDays(1))
                        .dataFim(LocalDateTime.now().plusDays(1).plusHours(2))
                        .status("CONFIRMADA")
                        .build();

                Reserva r2 = Reserva.builder()
                        .usuarioId(2L)
                        .recursoId(3L) // 'Notebook Dell Latitude' do resource-service
                        .dataInicio(LocalDateTime.now().plusDays(2))
                        .dataFim(LocalDateTime.now().plusDays(2).plusHours(4))
                        .status("PENDENTE")
                        .build();

                repository.saveAll(List.of(r1, r2));
                System.out.println("[DEBUG_LOG] MongoDB populado com reservas iniciais.");
            }
        };
    }
}
