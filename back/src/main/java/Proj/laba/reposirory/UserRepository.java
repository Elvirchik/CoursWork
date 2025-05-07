package Proj.laba.reposirory;

import Proj.laba.model.User;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends GenericRepository<User>, JpaSpecificationExecutor<User> {
    Optional<User> findByEmail(String email);
}
