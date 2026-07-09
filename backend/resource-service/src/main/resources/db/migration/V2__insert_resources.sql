INSERT INTO CATEGORIA (nome) VALUES ('Salas'), ('Equipamentos');

-- Inserindo Recursos (Auditórios)
INSERT INTO RECURSO (nome, descricao, categoria_id, tipo_recurso) VALUES 
('Auditório Principal', 'Auditório com 200 lugares', 1, 'AUDITORIO'),
('Sala de Reuniões A', 'Sala para 10 pessoas', 1, 'AUDITORIO');

INSERT INTO AUDITORIO (recurso_id, capacidade) VALUES 
(1, 200),
(2, 10);

-- Inserindo Recursos (Notebooks)
INSERT INTO RECURSO (nome, descricao, categoria_id, tipo_recurso) VALUES 
('Notebook Dell Latitude', 'Notebook para uso docente', 2, 'NOTEBOOK'),
('MacBook Pro', 'Notebook de alto desempenho', 2, 'NOTEBOOK');

INSERT INTO NOTEBOOK (recurso_id, marca, modelo) VALUES 
(3, 'Dell', 'Latitude 5420'),
(4, 'Apple', 'MacBook Pro M1');
