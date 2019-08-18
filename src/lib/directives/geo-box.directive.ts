import { Directive, ElementRef, Input, OnChanges, Renderer2, SimpleChanges } from '@angular/core';
import { Rect } from '@ui-model/core';
import { geoBounds } from 'd3-geo';
import { Feature, FeatureCollection, GeometryObject } from 'geojson';
import { flatMap, max, min } from 'lodash';
import { GeoProjectionService } from '../services/geo-projection.service';

@Directive({
  selector: 'svg[uiGeoBox]',
})
export class GeoBoxDirective implements OnChanges {

  constructor(private projection: GeoProjectionService, private element: ElementRef<Element>, private renderer: Renderer2) {
  }

  @Input('uiGeoBox') geoBox: FeatureCollection<GeometryObject>;

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.geoBox) {
      return;
    }
    const values = flatMap(this.geoBox.features, (feature: Feature<GeometryObject>) => geoBounds(feature))
      .map((coordinate: [number, number]) => {
        return this.projection.project(coordinate);
      });
    const xList = values.map((xy) => xy[0]);
    const yList = values.map((xy) => xy[1]);
    const xMin = min(xList);
    const yMin = min(yList);
    const xMax = max(xList);
    const yMax = max(yList);
    const bounds = Rect.from(xMin, yMin, xMax - xMin, yMax - yMin);
    this.renderer.setAttribute(this.element.nativeElement, 'width', bounds.width.toString());
    this.renderer.setAttribute(this.element.nativeElement, 'height', bounds.height.toString());
    this.renderer.setAttribute(this.element.nativeElement, 'viewBox', `${bounds.left} ${bounds.top} ${bounds.width} ${bounds.height}`);
  }
}
