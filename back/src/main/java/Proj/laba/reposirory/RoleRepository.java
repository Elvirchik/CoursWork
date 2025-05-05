package Proj.laba.reposirory;

import Proj.laba.model.Role;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface RoleRepository extends GenericRepository<Role> {
    Optional<Role> findByTitle(String title);  // Изменено с findByName на findByTitle
}
