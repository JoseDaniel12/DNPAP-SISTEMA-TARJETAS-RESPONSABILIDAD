import { InputTextarea } from 'primereact/inputtextarea';

function ComentarioStep({ comentario, updateFields }) {
    // Funcion para evitar que se haga un salto de linea al presionar enter en la descripción
    const handleKeyDowDescripcion = (e) => {
        if (e.keyCode === 13) {
            e.preventDefault();
        }
    }

    const onChangeComentario = e => {
        // Elimina los saltos de linea
        updateFields({comentario: e.target.value.replace(/[\r\n]+/gm, '')});
    };

    return (
        <div>
            <InputTextarea
                placeholder='Anotación sobre la tarjeta.'
                rows={7}
                value={comentario}
                onKeyDown={handleKeyDowDescripcion}
                onChange={onChangeComentario}
                className='my-2'
                style={{resize: 'none'}}
            />
        </div>
    );
}

export default ComentarioStep;
