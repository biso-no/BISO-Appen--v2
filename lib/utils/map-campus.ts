//Function to map campus by id.
export const mapCampus = (campusId: string) => {
    switch (campusId) {
        case '5':
            return 'National'
            break;
        case '4':
            return 'Stavanger'
            break;
        case '3':
            return 'Trondheim'
            break;
        case '2':
            return 'Bergen'
            break;
        case '1':
            return 'Oslo'
            break;
        default:
            return 'National'
    }
}