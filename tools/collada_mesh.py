import json
import xml.etree.ElementTree as ET


def convert_collada(source, destination, excluded=()):
    document = ET.parse(source)
    ns = {'c': 'http://www.collada.org/2005/11/COLLADASchema'}
    arrays = {'position': [], 'normal': [], 'texcoord': []}

    for geometry in document.findall('.//c:library_geometries/c:geometry', ns):
        if geometry.get('id') in excluded:
            continue
        mesh = geometry.find('c:mesh', ns)
        sources = {}
        for source in mesh.findall('c:source', ns):
            values = [float(value) for value in source.find('c:float_array', ns).text.split()]
            stride = int(source.find('c:technique_common/c:accessor', ns).get('stride'))
            sources[source.get('id')] = (values, stride)
        vertices = {
            vertex.get('id'): vertex.find('c:input', ns).get('source')[1:]
            for vertex in mesh.findall('c:vertices', ns)
        }
        for polygon in mesh.findall('c:polylist', ns):
            inputs = polygon.findall('c:input', ns)
            if not any(item.get('semantic') == 'TEXCOORD' for item in inputs):
                continue
            stride = max(int(item.get('offset')) for item in inputs) + 1
            indices = [int(value) for value in polygon.find('c:p', ns).text.split()]
            counts = [int(value) for value in polygon.find('c:vcount', ns).text.split()]
            cursor = 0
            for count in counts:
                for corner in range(1, count - 1):
                    for vertex in (0, corner, corner + 1):
                        for item in inputs:
                            semantic = item.get('semantic')
                            source_id = item.get('source')[1:]
                            if semantic == 'VERTEX':
                                source_id = vertices[source_id]
                            key = {'VERTEX': 'position', 'NORMAL': 'normal', 'TEXCOORD': 'texcoord'}.get(semantic)
                            if key is None:
                                continue
                            values, width = sources[source_id]
                            index = indices[cursor + vertex * stride + int(item.get('offset'))]
                            arrays[key].extend(values[index * width:index * width + width])
                cursor += count * stride

    positions = arrays['position']
    minimum = [min(positions[axis::3]) for axis in range(3)]
    maximum = [max(positions[axis::3]) for axis in range(3)]
    center_x = (minimum[0] + maximum[0]) / 2
    center_z = (minimum[2] + maximum[2]) / 2
    height = maximum[1] - minimum[1]
    for index in range(0, len(positions), 3):
        positions[index] = round((positions[index] - center_x) / height, 7)
        positions[index + 1] = round((positions[index + 1] - minimum[1]) / height, 7)
        positions[index + 2] = round((positions[index + 2] - center_z) / height, 7)

    output = {
        key: {'numComponents': 2 if key == 'texcoord' else 3, 'data': values}
        for key, values in arrays.items()
    }
    destination.write_text(json.dumps(output, separators=(',', ':')), encoding='utf-8')
    return len(positions) // 9
