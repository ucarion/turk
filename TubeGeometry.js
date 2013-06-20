/**
\brief A simple tube geometry class for generating a geometric tube.

@params radiusTop           float   Outer radius at the top of tube [0....+inf]
@params radiusBottom        float   Outer radius at the bottom of tube [0....+inf]
@params radiusInnerTop      float   Inner radius at the top of tube [0....+inf]
@params radiusInnerBottom   float   Inner radius at the bottom of tube [0....+inf]
@params height              float   Height of the tube [0....+inf]
@params radiusSegments      int     The total radial segments [3...+inf]
@params heightSegments      int     The total height segments [1...+inf]
@params openEnded           bool    If true, the tube is open ended, capped otherwise

\description
This class generates a 3D tube geometric object oriented on the Y axis. The radiusTop 
and radiusBottom params are for the outer radius of the tube at the top and bottom 
respectively. Likewise, the radiusInnerTop/radiusInnerBottom params are for the inner 
radius at the top and bottom respectively. The rest of the params are analogous to 
that in the THREE.CylinderGeometry class.

\example_usage

var tubeGeometry = new THREE.TubeGeometry(2,2,1,1,4,20,1,false);
var tube = new THREE.Mesh( tubeGeometry,new THREE.MeshLambertMaterial( { color: 0xff0000, wireframe:true} ) );    
scene.add(tube);

\see CubeGeometry.js

\author Muhamamd Mobeen Movania

\last_modified: 20/03/2013
*/

THREE.TubeGeometry = function ( radiusTop, radiusBottom, radiusInnerTop, radiusInnerBottom, height, radiusSegments, heightSegments, openEnded ) {

  THREE.Geometry.call( this ); 
    
  radiusTop = radiusTop !== undefined ? radiusTop : 2;
  radiusBottom = radiusBottom !== undefined ? radiusBottom : 2;
  radiusInnerTop = radiusInnerTop !== undefined ? radiusInnerTop : 1;
  radiusInnerBottom = radiusInnerBottom !== undefined ? radiusInnerBottom : 1;
  height = height !== undefined ? height : 4;

  var heightHalf = height / 2;
  var segmentsX = radiusSegments || 8;
  var segmentsY = heightSegments || 1;

  var x, y, indices = [], uvs = [];
    var count = 0;
  for ( y = 0; y <= segmentsY; y ++ ) {
        var tindices = [];
    var uvsRow = [];
        var v = y / segmentsY;
    var radius = v * ( radiusBottom - radiusTop ) + radiusTop;
    var radiusInner = v * ( radiusInnerBottom - radiusInnerTop ) + radiusInnerTop;
        for ( x = 0; x <= segmentsX; x ++ ) {
            var u = x / segmentsX;
        var vertex1 = new THREE.Vector3();
        var vertex2 = new THREE.Vector3();
        
        //vertex at outer radius (stored at even index)       
        vertex1.x = radius * Math.sin( u * Math.PI * 2 );
        vertex1.y = - v * height + heightHalf;
      vertex1.z = radius * Math.cos( u * Math.PI * 2 );
        this.vertices.push( vertex1 );
            tindices.push(count++);
      uvsRow.push( new THREE.Vector2( u, 1 - v ) );
      
      //vertex at inner radius (stored at odd index)       
      vertex2.x = radiusInner * Math.sin( u * Math.PI * 2 );
      vertex2.y = - v * height + heightHalf;
      vertex2.z = radiusInner * Math.cos( u * Math.PI * 2 );
      this.vertices.push( vertex2 );
            tindices.push(count++);
      uvsRow.push( new THREE.Vector2( u, 1 - v ) );
       
        }
      indices.push( tindices ); 
      uvs.push( uvsRow );
  }
 
  var tanTheta = ( radiusBottom - radiusTop ) / height; 
  var na, nb;

  for ( x = 0; x < segmentsX*2; x ++ ) {
    if ( radiusTop !== 0 ) {
      na = this.vertices[ indices[ 0 ][ x ] ].clone();
      nb = this.vertices[ indices[ 0 ][ x + 1 ] ].clone();
    } else {
      na = this.vertices[ indices[ 1 ][ x ] ].clone();
      nb = this.vertices[ indices[ 1 ][ x + 1 ] ].clone(); 
    } 
    na.setY( Math.sqrt( na.x * na.x + na.z * na.z ) * tanTheta ).normalize();
    nb.setY( Math.sqrt( nb.x * nb.x + nb.z * nb.z ) * tanTheta ).normalize();
    for ( y = 0; y < segmentsY; y ++ ) {
      var v1 = indices[ y ][ x ];
      var v2 = indices[ y + 1 ][ x ];
      var v3 = indices[ y + 1 ][ x + 2];
      var v4 = indices[ y ][ x + 2 ]; 
      var n1 = na.clone(); 
      var n2 = nb.clone();  
      
      var uv1 = uvs[ y ][ x ].clone();
      var uv2 = uvs[ y + 1 ][ x ].clone();
      var uv3 = uvs[ y + 1 ][ x + 2 ].clone();
      var uv4 = uvs[ y ][ x + 2 ].clone(); 
            
            //vertices with even index are at the outer radius
      //vertices with odd index are at the inner radius
      //we reverse winding for inner radius by swapping v3 with v4 and v1 with v2
      //also flip the normals
      if(x % 2 != 0) {
          var tmp = v3;
          v3 = v4;
          v4 = tmp;         
          tmp = v2;
          v2 = v1;
          v1 = tmp;   
          
          n1.x = -n1.x;
          n1.y = -n1.y;
          n1.z = -n1.z;
          
          n2.x = -n2.x; 
          n2.y = -n2.y; 
          n2.z = -n2.z; 
          
          //swap UV coordinates
          tmp = uv3;
          uv3 = uv4;
          uv4 = tmp;
          
          tmp = uv1;
          uv1 = uv2;
          uv2 = tmp; 
      } 
      
            this.faces.push( new THREE.Face4( v1, v2, v3, v4, [ n1, n1, n2, n2 ] ) );
      this.faceVertexUvs[ 0 ].push( [ uv1, uv2, uv3, uv4 ] ); 
    }
  }
 
  // top cap 
  var n1 = new THREE.Vector3( 0, 1, 0 ); 
  
  if ( !openEnded && radiusTop > 0 ) { 
  
    for ( x = 0; x < segmentsX*2; x ++ ) {
    
      var v1 = indices[ 0 ][ x     ];
      var v2 = indices[ 0 ][ x + 1 ];
      var v3 = indices[ 0 ][ x + 2 ]; 
      
      var uv1 = uvs[ 0 ][ x ].clone();
      var uv2 = uvs[ 0 ][ x + 1 ].clone();
      var uv3 = uvs[ 0 ][ x + 2 ].clone();
            
            if( x % 2 !=0) {
                //if we are at an odd index, we push the indices in the given order
          this.faces.push( new THREE.Face3( v1, v2, v3, [ n1, n1, n1 ] ) );
          this.faceVertexUvs[ 0 ].push( [ uv1, uv2, uv3 ] );
          
      } else { 
          //if we are at an even index, we swap the last two indices          
          this.faces.push( new THREE.Face3( v1, v3, v2, [ n1, n1, n1 ] ) );
          this.faceVertexUvs[ 0 ].push( [ uv1, uv3, uv2 ] );
      }
    }
  }
 
  // bottom cap
    var n2 = new THREE.Vector3( 0, -1, 0 ); 
    
  if ( !openEnded && radiusBottom > 0) { 
        
    for ( x = 0; x < segmentsX*2; x ++ ) {

      var v1 = indices[ y ][ x + 1 ];
      var v2 = indices[ y ][ x ];
      var v3 = indices[ y ][ x + 2 ]; 
      var uv1 = uvs[ y ][ x + 1 ].clone();
      var uv2 = uvs[ y ][ x ].clone();
      var uv3 = uvs[ y ][ x + 2 ].clone();

            if( x % 2 !=0) {
                //if we are at an odd index, we push the indices in the given order
          this.faces.push( new THREE.Face3( v1, v2, v3, [ n2, n2, n2 ] ) );
          this.faceVertexUvs[ 0 ].push( [ uv1, uv2, uv3 ] );
            } else {
                //if we are at an even index, we swap the last two indices  
                this.faces.push( new THREE.Face3( v1, v3, v2, [ n2, n2, n2 ] ) );
          this.faceVertexUvs[ 0 ].push( [ uv1, uv3, uv2 ] );
            }
    }

  }
 
  this.computeCentroids();
  this.computeFaceNormals(); 
}

THREE.TubeGeometry.prototype = Object.create( THREE.Geometry.prototype );