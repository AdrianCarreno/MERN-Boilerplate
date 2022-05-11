import '../../global.scss'

const GraphicProgress = () => {
    const graphs: any[] = [
        {
            id: 0,
            description: 'Ingresos La Reina'
        },
        {
            id: 1,
            description: 'Ingresos La Reina'
        },
        {
            id: 2,
            description: 'Ingresos La Reina'
        },
        {
            id: 3,
            description: 'Ingresos Puente Alto'
        },
        {
            id: 4,
            description: 'Ingresos Puente Alto'
        },
        {
            id: 5,
            description: 'Ingresos Puente Alto'
        }
    ]
    return (
        <div className="row margin-top-50 margin-bottom-50">
            {
                graphs.map((element: any, id: number) => {
                    return (
                        <div key={id} className="col-sm-12 col-md-6 col-lg-4 margin-top-20">
                            <div className="card with-18rem center border-radius-30 text-align-center">
                                <p className="margin-top-10">{element.description}</p>
                                <img src="./images/templates/graph.png" className='image-graphic' />
                            </div>
                        </div>
                    )
                })
            }
        </div>
    )
}

export default GraphicProgress
