(function()
{
    var scene       =   create_scene();
    var camera      =   create_camera();
    var renderer    =   create_renderer();
    var controls    =   create_controls();
    var clock       =   create_clock();
    var radius      =   800;
    var url         =   "models.json";
    var name        =   null;
    var folder      =   null;
    var designer    =   null;
    var description =   create_description();
    var previously_selected_index = -1;

    $.ajax( { dataType  : "json"
            , url       : url
            , success   :   function(data)
                            {
                                models = data;
                                setup();
                            }

            }
          );

    function create_scene()
    {
        return new THREE.Scene();
    }

    function create_camera()
    {
        return new THREE.PerspectiveCamera( 45
                                          , window.innerWidth / window.innerHeight
                                          , 0.1
                                          , 1000
                                          );
    }

    function create_renderer()
    {
        var renderer = new THREE.CSS3DRenderer();
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.domElement.style.position = 'absolute';
        document.getElementById('container').appendChild(renderer.domElement);
        return renderer;
    }

    function create_controls()
    {
        return new THREE.TrackballControls( camera, renderer.domElement );
    }

    function create_clock()
    {
        return new THREE.Clock();
    }

    function setup()
    {
        var vertices = sphere(models.length, radius);
        setup_models(vertices);
        setup_tweens();
        camera.position.x = radius * 2.8;
        camera.position.y = 0;
        camera.position.z = 0;
        camera.lookAt(scene.position);
        window.addEventListener( 'resize', on_window_resize, false );
        render();
    }

    function render()
    {
        TWEEN.update();
        var delta = clock.getDelta();
        controls.update(delta);
        requestAnimationFrame(render);
        renderer.render(scene, camera);
    }

    function setup_tweens()
    {
        $(document).click(
            function(event)
            {
                var className = event.target.className;
                if(className === "model")
                {
                    TWEEN.removeAll();
                    var index = parseInt(event.target.id);
                    if(index === previously_selected_index)
                    {
                        return;
                    }
                    previously_selected_index = index;
                    // description.detach();
                    description.hide();
                    var object = models[index].css_object;
                    describe_model(index);
                    description.fadeIn(4000);
                    new TWEEN.Tween(camera.position)
                             .to( { x: object.position.x * 1.4
                                  , y: object.position.y * 1.4
                                  , z: object.position.z * 1.4
                                  }
                                  , 2000
                                )
                             .easing(TWEEN.Easing.Exponential.InOut)
                             .onUpdate(
                                function()
                                {
                                    camera.lookAt(object.position);
                                }
                                      )
                             .onComplete(
                                function ()
                                {
                                    camera.lookAt(object.position);
                                }
                                        )
                             .start();
                }
                else
                {
                    if(previously_selected_index === -1) return;
                    previously_selected_index = -1;
                    description.fadeOut(2000);
                    new TWEEN.Tween(camera.position)
                             .to( { x: camera.position.x * 2
                                  , y: camera.position.y * 2
                                  , z: camera.position.z * 2
                                  }
                                  , 2000
                                )
                             .easing(TWEEN.Easing.Exponential.InOut)
                             .onUpdate(
                                function()
                                {
                                    camera.lookAt(scene.position);
                                }
                                      )
                             .onComplete(
                                function ()
                                {
                                    camera.lookAt(scene.position);
                                }
                                        )
                             .start();
                }
            }
        );
    }

    function describe_model(index)
    {
        var model = models[index];
        name.text(model.name);
        designer.text("Designed by " + model.designer);
        folder.text("Folded by " + model.folder);
    }

    function create_description()
    {
        description = $("<div>").css( { "z-index"       :   "1"
                                      , "margin"        :   "2%"
                                      , "padding"       :   "0%"
                                      , "position"    :   "absolute"
                                      , "color"       :   "white"
                                      , "font-weight" :   "bold"
                                      , "font-family": "Calibri, Candara, Segoe, Segoe UI, Optima, Arial, sans-serif"
                                      , "width"     : "100%"
                                      , "height"    : "auto"
                                      }
                                    )
                                .attr("id", "description");

        name = $("<div>").css( { "margin-left" :   "1%"
                                   , "margin-top"  :   "1%"
                                   , "margin-bottom": "1%"
                                   , "font-size"   :   "300%"
                                   }
                                 )
                             .attr("id", "name");

        designer = $("<div>").css( { "margin-left" :   "1%"
                                       , "margin-top"  :   "1%"
                                       , "font-size"   :   "150%"
                                       }
                                   )
                               .attr("id", "designer");

        folder = $("<div>").css( { "margin-left" :   "1%"
                                     , "margin-top"  :   "1%"
                                     , "font-size"   :   "150%"
                                     }
                                   )
                               .attr("id", "folder");

        // var source = $("<div>").css( { "margin-left" :   "1%"
        //                              , "margin-top"  :   "1%"
        //                              , "color"       :   "white"
        //                              , "font-weight" :   "bold"
        //                              , "font-size"   :   "100%"
        //                              }
        //                            )
        //                        .text("Source   : Some stupid book or website")
        //                        .attr("id", "source");

        // var remarks = $("<div>").css( { "margin-left" :   "1%"
        //                              , "margin-top"  :   "1%"
        //                              , "color"       :   "white"
        //                              , "font-weight" :   "bold"
        //                              , "font-size"   :   "100%"
        //                              }
        //                            )
        //                        .text("Remarks  : " + index)
        //                        .attr("id", "remarks");
        $("body").append(description);
        description.fadeOut(0.0);
        return description.append(name)
                         .append(designer)
                         .append(folder);
                   // .append(source)
                   // .append(remarks);

    }

    function setup_models(vertices)
    {
        var vector = new THREE.Vector3();
        var temp = new THREE.Object3D();
        $.each(models,
            function(index, model)
            {
                var vertex = vertices[index];
                var element = document.createElement( 'div' );
                element.className = 'model';
                element.id=index;
                element.style.backgroundColor = "rgba("
                                              + parseInt(Math.random() * 255)
                                              + ","
                                              + parseInt( Math.random() * 255)
                                              + ","
                                              + parseInt( Math.random() * 255 )
                                              + ","
                                              + ( Math.random() * 0.5 + 0.25 )
                                              + ')';
                // element.style.background = "url(" + model.url + ") no-repeat";

                var css_object = new THREE.CSS3DObject( element );

                css_object.position.x = vertex.x;
                css_object.position.y = vertex.y;
                css_object.position.z = vertex.z;

                temp.position.x = vertex.x;
                temp.position.y = vertex.y;
                temp.position.z = vertex.z;

                vector.copy( temp.position ).multiplyScalar( 2 );

                temp.lookAt( vector );

                css_object.rotation.x = temp.rotation.x;
                css_object.rotation.y = temp.rotation.y;
                css_object.rotation.z = temp.rotation.z;

                model.css_object = css_object;
                scene.add(css_object);

                $(element).click(
                    function()
                    {
                        console.log(index);
                        show_model_information(index);
                    }
                );
            }
        );
    }

    function sphere(points, radius)
    {
        var vertices = []
        for ( var i = 0; i < points; i ++ )
        {
            var phi = Math.acos( -1 + ( 2 * i ) / points );
            var theta = Math.sqrt( points * Math.PI ) * phi;
            vertices.push( new THREE.Vector3( radius * Math.sin(phi) * Math.cos(theta)
                                            , radius * Math.sin(phi) * Math.sin(theta)
                                            , radius * Math.cos(phi)
                                            )
                         );
        }
        return vertices;
    }

    function show_model_information(index)
    {
        console.log("Show model information: " + index);
    }

    function on_window_resize()
    {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
        render();
    }

})();
