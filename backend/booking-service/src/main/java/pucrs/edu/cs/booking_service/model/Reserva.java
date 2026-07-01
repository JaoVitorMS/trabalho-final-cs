package pucrs.edu.cs.booking_service.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "reservas")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Reserva {

    @Id
    private String id;

    private Long usuarioId;

    private Long recursoId;

    private LocalDateTime dataInicio;

    private LocalDateTime dataFim;

    private String status;
}
