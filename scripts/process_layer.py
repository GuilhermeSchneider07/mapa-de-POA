
import argparse
from pathlib import Path

import geopandas as gpd


def process_layer(source, destination, simplify_m=0):

    source = Path(source)
    destination = Path(destination)

    print(f"Lendo: {source}")

    gdf = gpd.read_file(source)

    if gdf.empty:
        raise ValueError("O arquivo não possui registros.")

    if gdf.crs is None:
        raise ValueError(
            "O arquivo não possui sistema de coordenadas definido."
        )

    # Remover geometrias vazias ou ausentes
    gdf = gdf[
        gdf.geometry.notna()
        & ~gdf.geometry.is_empty
    ].copy()

    # Simplificação opcional, em metros.
    # EPSG:31982 = SIRGAS 2000 / UTM zone 22S.
    if simplify_m > 0:
        gdf = gdf.to_crs(epsg=31982)

        gdf["geometry"] = gdf.geometry.simplify(
            simplify_m,
            preserve_topology=True
        )

    # Converter para coordenadas geográficas
    gdf = gdf.to_crs(epsg=4326)

    destination.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    # Exportar GeoJSON
    gdf.to_file(
        destination,
        driver="GeoJSON",
        index=False
    )

    print("\nProcessamento concluído!")
    print(f"Registros: {len(gdf)}")
    print(f"Destino: {destination}")
    print(f"CRS: {gdf.crs}")


if __name__ == "__main__":

    parser = argparse.ArgumentParser(
        description="Converte dados geográficos para GeoJSON."
    )

    parser.add_argument("source")
    parser.add_argument("destination")

    parser.add_argument(
        "--simplify-m",
        type=float,
        default=0,
        help="Tolerância de simplificação em metros."
    )

    args = parser.parse_args()

    process_layer(
        args.source,
        args.destination,
        args.simplify_m
    )
