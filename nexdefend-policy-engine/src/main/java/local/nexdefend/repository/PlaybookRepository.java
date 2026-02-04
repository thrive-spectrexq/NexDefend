package local.nexdefend.repository;

import local.nexdefend.model.Playbook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlaybookRepository extends JpaRepository<Playbook, Long> {
}
