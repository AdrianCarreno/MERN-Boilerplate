import { t } from 'i18next'
import { BranchOffices, GraphicProgress, SliderHome } from '../../components'

export default function HomePage() {
    return (
        <div className="container">
            <h1 className="text-center" style={{ paddingTop: '20%' }}>
                {t('homePage:description')}
            </h1>
            <SliderHome />
            <GraphicProgress />
            <BranchOffices />
        </div>
    )
}
