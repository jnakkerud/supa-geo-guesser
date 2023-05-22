create table theme (
    id bigint generated by default as identity primary key,
    updated_at timestamp with time zone,
    name text unique not null,
    description text
);

CREATE TYPE source_type_enum AS ENUM ('url', 'stored', 'flickr');
create table image (
    id bigint generated by default as identity primary key,
    updated_at timestamp with time zone,
    source_type source_type_enum not null,
    source text unique not null,
    location geography(POINT) not null,
    description text
);

create table theme_image (
    id bigint generated by default as identity primary key,
    theme_id bigint not null references public.theme,
    image_id bigint not null references public.image
);