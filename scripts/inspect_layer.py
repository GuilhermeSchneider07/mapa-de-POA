
import sys
import geopandas as gpd


def inspect_layer(file_path):

    print("\nCarregando arquivo...")

    gdf = gpd.read_file(file_path)

    print("\n========== INFORMAÇÕES ==========")

    print(f"Arquivo: {file_path}")

    print(f"\nQuantidade de registros: {len(gdf)}")

    print(f"\nSistema de coordenadas: {gdf.crs}")

    print(f"\nTipos de geometria:")
    print(gdf.geometry.geom_type.value_counts())

    print("\nColunas disponíveis:")

    for column in gdf.columns:
        print(f"- {column}")

    print("\nPrimeiros registros:")

    print(gdf.head())

    print("\n=================================")


if __name__ == "__main__":

    if len(sys.argv) < 2:
        print(
            "Uso: python scripts/inspect_layer.py "
            "caminho_do_arquivo"
        )
        sys.exit(1)

    inspect_layer(sys.argv[1])
