import '../../global.scss'

const BranchOffices = () => {
    const bOffices: any[] = [
        {
            id: 0,
            description: 'Sucursal La Reina',
            address: 'Tobalaba #7882',
            hr: 'Lun-Vie 09:00hrs - 20:00hrs',
            phone: '+56935566799'
        },
        {
            id: 1,
            description: 'Sucursal La Reina',
            address: 'Tobalaba #7882',
            hr: 'Lun-Vie 09:00hrs - 20:00hrs',
            phone: '+56935566799'
        },
        {
            id: 2,
            description: 'Sucursal La Reina',
            address: 'Tobalaba #7882',
            hr: 'Lun-Vie 09:00hrs - 20:00hrs',
            phone: '+56935566799'
        },
        {
            id: 3,
            description: 'Sucursal La Reina',
            address: 'Tobalaba #7882',
            hr: 'Lun-Vie 09:00hrs - 20:00hrs',
            phone: '+56935566799'
        },
        {
            id: 4,
            description: 'Sucursal La Reina',
            address: 'Tobalaba #7882',
            hr: 'Lun-Vie 09:00hrs - 20:00hrs',
            phone: '+56935566799'
        },
        {
            id: 5,
            description: 'Sucursal La Reina',
            address: 'Tobalaba #7882',
            hr: 'Lun-Vie 09:00hrs - 20:00hrs',
            phone: '+56935566799'
        }
    ]
    return (
        <div className="row margin-top-50 margin-bottom-50 background-bOffices">
            {
                bOffices.map((element: any, id: number) => {
                    return (
                        <div key={id} className="col-xs-12 col-sm-6 col-md-6 col-lg-4 col-xl-3 margin-top-20 margin-bottom-20">
                            <div className='position-float-left'>

                            </div>
                            <div className='position-float-right'>
                                <p className='margin-0'>{element.description}</p>
                                <p className='margin-0'>{element.address}</p>
                                <p className='margin-0'>{element.hr}</p>
                                <p className='margin-0'>{element.phone}</p>
                            </div>
                        </div>
                    )
                })
            }
        </div>
    )
}

export default BranchOffices
