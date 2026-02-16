
package com.rpgapp.rpg_webapp.board.snapshot;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import lombok.Getter; import lombok.Setter; import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @SuperBuilder
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes({
        @JsonSubTypes.Type(value = StrokeObject.class, name = "stroke"),
        @JsonSubTypes.Type(value = ShapeObject.class,  name = "shape"),
        @JsonSubTypes.Type(value = TokenObject.class,  name = "token"),
        @JsonSubTypes.Type(value = FogEraseObject.class,  name = "fog")
})
public abstract class BoardObject {
    private String type;          
    private String objectId;     
    private Long ownerId;
    private LocalDateTime createdAt;
}
